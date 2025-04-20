use wasm_bindgen::prelude::*;
use image::{ImageBuffer, Rgba};

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