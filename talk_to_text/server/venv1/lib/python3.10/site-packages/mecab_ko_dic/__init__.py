from pathlib import Path

__version__ = "2.1.1.post2"

_current_path = Path(__file__).absolute().parent

dictionary_path = _current_path / "dictionary"
model_path = dictionary_path / "model.bin"
