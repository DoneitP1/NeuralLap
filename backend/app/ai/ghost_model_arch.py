import torch
import torch.nn as nn

class GhostNet(nn.Module):
    def __init__(self, input_size=4, hidden_size=128, num_layers=2):
        """
        Neural Network for the AI Doppelgänger.
        
        Args:
            input_size (int): Number of telemetry features (Speed, RPM, TrackPos, Heading).
            hidden_size (int): LSTM hidden dimension.
            num_layers (int): Number of LSTM layers.
        """
        super(GhostNet, self).__init__()
        
        # 1. Temporal Feature Extractor
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )
        
        # 2. Driving Policy Head
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Linear(64, 32),
            nn.ReLU()
        )
        
        # 3. Output Heads (Steering, Throttle, Brake)
        # Steering: Tanh -> [-1, 1]
        self.steering_head = nn.Linear(32, 1)
        # Pedals: Sigmoid -> [0, 1]
        self.throttle_head = nn.Linear(32, 1)
        self.brake_head = nn.Linear(32, 1)

    def forward(self, x):
        """
        Forward pass.
        
        Args:
            x (Tensor): Sequence of telemetry frames [Batch, SeqLen, Features]
        """
        # LSTM output: [Batch, SeqLen, Hidden]
        # We only care about the last hidden state for prediction
        out, (hn, cn) = self.lstm(x)
        
        # Take the last time step
        last_step = out[:, -1, :]
        
        # Latent Driving Features
        features = self.fc(last_step)
        
        # Action Prediction
        steering = torch.tanh(self.steering_head(features))
        throttle = torch.sigmoid(self.throttle_head(features))
        brake = torch.sigmoid(self.brake_head(features))
        
        return torch.cat([steering, throttle, brake], dim=1)

if __name__ == "__main__":
    # Sanity Check
    model = GhostNet()
    print("GhostNet Architecture:")
    print(model)
    
    # Fake Batch: 1 Sample, 50 Time Steps, 4 Features (Speed, RPM, TrackPos, Heading)
    dummy_input = torch.randn(1, 50, 4)
    output = model(dummy_input)
    print("\nForward Pass Test Output [Steering, Throttle, Brake]:")
    print(output)
