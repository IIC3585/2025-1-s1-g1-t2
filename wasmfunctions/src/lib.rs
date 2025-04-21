use wasm_bindgen::prelude::*;
use image::{ImageBuffer, Rgba, RgbaImage};

#[wasm_bindgen]
pub fn grayscale(img_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let img = ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, img_data.to_vec())
        .expect("Failed to create ImageBuffer");

    let mut output = ImageBuffer::new(width, height);

    for (x, y, pixel) in img.enumerate_pixels() {
        let r = pixel[0] as f32;
        let g = pixel[1] as f32;
        let b = pixel[2] as f32;
        let gray_value = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
        output.put_pixel(x, y, Rgba([gray_value, gray_value, gray_value, pixel[3]]));
    }

    output.into_raw()
}

#[wasm_bindgen]
pub fn sepia(img_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let img = ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, img_data.to_vec())
        .expect("Failed to create ImageBuffer");

    let mut output = ImageBuffer::new(width, height);

    for (x, y, pixel) in img.enumerate_pixels() {
        let r = pixel[0] as f32;
        let g = pixel[1] as f32;
        let b = pixel[2] as f32;
        let tr = (0.393 * r + 0.769 * g + 0.189 * b).min(255.0) as u8;
        let tg = (0.349 * r + 0.686 * g + 0.168 * b).min(255.0) as u8;
        let tb = (0.272 * r + 0.534 * g + 0.131 * b).min(255.0) as u8;
        output.put_pixel(x, y, Rgba([tr, tg, tb, pixel[3]]));
    }

    output.into_raw()
}

#[wasm_bindgen]
pub fn cold_inverse(img_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let img = ImageBuffer::<Rgba<u8>, _>::from_raw(width, height, img_data.to_vec())
        .expect("Failed to create ImageBuffer");

    let mut output = ImageBuffer::new(width, height);

    for (x, y, pixel) in img.enumerate_pixels() {
        let [r, g, b, a] = pixel.0;

        let new_r = ((255 - r) as f32 * 0.5).min(255.0) as u8;
        let new_g = ((255 - g) as f32 * 0.8).min(255.0) as u8;
        let new_b = ((255 - b) as f32 * 1.1).min(255.0) as u8;
        let new_a = (a as f32 * 0.9).round() as u8; 

        output.put_pixel(x, y, Rgba([new_r, new_g, new_b, new_a]));

    }

    output.into_raw()
}

#[wasm_bindgen]
pub fn spectral_glow(img_data: &[u8], width: u32, height: u32) -> Vec<u8> {
    let img: RgbaImage = ImageBuffer::from_raw(width, height, img_data.to_vec())
        .expect("Failed to create ImageBuffer");

    let mut output = ImageBuffer::new(width, height);

    for (x, y, pixel) in img.enumerate_pixels() {
        let [r, g, b, a] = pixel.0;

        
        let new_r = (r as f32 * 0.6).min(255.0) as u8;
        let new_g = (g as f32 * 0.7).min(255.0) as u8;
        
        let boosted_b = (b as f32 * 1.4 + r as f32 * 0.2).min(255.0) as u8;

        let intensity = (r as f32 + g as f32 + b as f32) / 3.0;
        let glow = ((intensity / 255.0).powf(1.5) * 50.0).min(60.0) as u8;

        let final_b = boosted_b.saturating_add(glow);
        let final_a = (a as f32 * 0.95 + glow as f32 * 0.2).min(255.0) as u8;

        output.put_pixel(x, y, Rgba([new_r, new_g, final_b, final_a as u8]));
    }

    output.into_raw()
}


