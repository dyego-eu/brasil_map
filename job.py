import kaggle

kaggle.api.authenticate()

kaggle.api.dataset_download_files("unanimad/corona-virus-brazil")

