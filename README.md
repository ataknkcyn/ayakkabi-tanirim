# Ayakkabı Tanıma Uygulaması

Fotoğraf yükleyip Claude AI ile ayakkabı tanıma yapan tek sayfalık web uygulaması.

## Nasıl Açılır?

Build aracı veya sunucu gerekmez. Doğrudan tarayıcıda açın:

```
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

Ya da dosya yöneticisinden `index.html` üzerine çift tıklayın.

## Kullanım

1. Sayfayı tarayıcıda açın.
2. **Claude API Anahtarı** alanına `sk-ant-...` anahtarınızı girin (localStorage'a kaydedilir).
3. Ayakkabı fotoğrafını sürükle-bırak ya da **Dosya Seç** butonu ile yükleyin.
4. **Analiz Et** butonuna tıklayın.
5. Sonuçları (marka, model, renk, tip, tahmini fiyat) sonuç kartında görün.

## Teknik Detaylar

- Saf HTML + CSS + Vanilla JavaScript (build tool yok)
- Claude API: `claude-haiku-4-5-20251001`
- Görseller base64 olarak API'ye iletilir
- API anahtarı yalnızca tarayıcı localStorage'ında saklanır; sunucuya gönderilmez
