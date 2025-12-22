import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from app.ai.ghost_model_arch import GhostNet
from loguru import logger

# Mock Dataset Generator (Since we don't have a massive DB yet)
class TelemetryDataset(Dataset):
    def __init__(self, num_samples=1000, seq_len=50):
        self.num_samples = num_samples
        self.seq_len = seq_len
        
        # Generate fake "perfect lap" data
        # Feature: [Speed, RPM, TrackPos, Heading]
        self.inputs = torch.randn(num_samples, seq_len, 4)
        
        # Target: [Steering, Throttle, Brake]
        self.targets = torch.rand(num_samples, 3) 
        # Normalize steering to [-1, 1]
        self.targets[:, 0] = (self.targets[:, 0] * 2) - 1

    def __len__(self):
        return self.num_samples

    def __getitem__(self, idx):
        return self.inputs[idx], self.targets[idx]

def train_ghost():
    logger.info("Initializing GhostNet Training...")
    
    # 1. Hyperparameters
    BATCH_SIZE = 32
    EPOCHS = 10
    LR = 0.001
    SEQUENCE_LENGTH = 50
    
    # 2. Data Preparation
    logger.info("Loading Telemetry Data...")
    dataset = TelemetryDataset(num_samples=5000, seq_len=SEQUENCE_LENGTH)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # 3. Model Setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = GhostNet(input_size=4).to(device)
    criterion = nn.MSELoss() # Imitation Learning = Minimize error vs Human
    optimizer = optim.Adam(model.parameters(), lr=LR)
    
    logger.info(f"Training on {device}...")
    
    # 4. Training Loop
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for inputs, targets in dataloader:
            inputs, targets = inputs.to(device), targets.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            
            loss = criterion(outputs, targets)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        avg_loss = total_loss / len(dataloader)
        logger.info(f"Epoch {epoch+1}/{EPOCHS} | Loss: {avg_loss:.6f}")
        
    # 5. Export
    logger.success("Training Complete. Exporting Ghost Model...")
    torch.save(model.state_dict(), "ghost_v1.pth")
    
    # ONNX Export for fast inference
    dummy_input = torch.randn(1, SEQUENCE_LENGTH, 4).to(device)
    torch.onnx.export(
        model, 
        dummy_input, 
        "ghost_v1.onnx", 
        verbose=False,
        input_names=["telemetry_sequence"],
        output_names=["controls"]
    )
    logger.success("Exported to 'ghost_v1.onnx'")

if __name__ == "__main__":
    train_ghost()
