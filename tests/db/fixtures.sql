-- Test-only catalog (kids products). Loaded by tests/db/harness.ts after seed.sql.
do $$
declare
  p_id uuid;
begin
  if exists (select 1 from public.products limit 1) then
    return;
  end if;

  -- 1) Baby cotton set
  insert into public.products (slug, category_id, name_ar, name_fr, name_en,
      description_ar, price, compare_at_price, is_active, is_featured, is_best_seller,
      delivery_days_min, delivery_days_max)
  values ('ensemble-bebe',
      (select id from public.categories where slug='baby'),
      'طقم رضيع قطني', 'Ensemble bébé coton', 'Baby cotton set',
      'طقم قطني ناعم ومريح للرضّع.', 2500, 3200, true, true, true, 2, 5)
  returning id into p_id;
  insert into public.product_images (product_id, url, position) values
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/baby-set-1.jpg', 0),
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/baby-set-2.jpg', 1);
  insert into public.product_variants (product_id, size, color, color_hex, stock, position) values
    (p_id, '3-6M', 'أزرق', '#4fb6ff', 8, 0),
    (p_id, '6-9M', 'أزرق', '#4fb6ff', 12, 1),
    (p_id, '9-12M', 'أزرق', '#4fb6ff', 5, 2),
    (p_id, '6-9M', 'أحمر', '#c0392b', 6, 3);

  -- 2) Girls' princess dress
  insert into public.products (slug, category_id, name_ar, name_fr, name_en,
      description_ar, price, is_active, is_featured, delivery_days_min, delivery_days_max)
  values ('robe-princesse',
      (select id from public.categories where slug='girls'),
      'فستان أميرة', 'Robe princesse', 'Princess dress',
      'فستان أميرة للبنات بقماش ناعم.', 4800, true, true, 2, 6)
  returning id into p_id;
  insert into public.product_images (product_id, url, position) values
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/princess-dress-1.jpg', 0),
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/princess-dress-2.jpg', 1);
  insert into public.product_variants (product_id, size, color, color_hex, stock, position) values
    (p_id, '4Y', 'وردي', '#ff7eb3', 4, 0),
    (p_id, '5Y', 'وردي', '#ff7eb3', 7, 1),
    (p_id, '6Y', 'وردي', '#ff7eb3', 3, 2);

  -- 3) Star pyjamas
  insert into public.products (slug, category_id, name_ar, name_fr, name_en,
      description_ar, price, is_active, is_best_seller, delivery_days_min, delivery_days_max)
  values ('pyjama-etoiles',
      (select id from public.categories where slug='pyjamas'),
      'بيجامة النجوم', 'Pyjama étoiles', 'Star pyjamas',
      'بيجامة قطنية مريحة للنوم.', 3200, true, true, 2, 5)
  returning id into p_id;
  insert into public.product_images (product_id, url, position) values
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/pyjamas-1.jpg', 0);
  insert into public.product_variants (product_id, size, color, color_hex, stock, position) values
    (p_id, '6Y', 'بيج', '#e8d5c4', 10, 0),
    (p_id, '8Y', 'بيج', '#e8d5c4', 9, 1);

  -- 4) Light-up sneakers
  insert into public.products (slug, category_id, name_ar, name_fr, name_en,
      description_ar, price, is_active, delivery_days_min, delivery_days_max)
  values ('baskets-lumineuses',
      (select id from public.categories where slug='shoes'),
      'حذاء رياضي مضيء', 'Baskets lumineuses', 'Light-up sneakers',
      'حذاء رياضي مريح بأضواء ملوّنة.', 3900, true, 3, 7)
  returning id into p_id;
  insert into public.product_images (product_id, url, position) values
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/sneakers-1.jpg', 0);
  insert into public.product_variants (product_id, size, color, color_hex, stock, position) values
    (p_id, '27', 'أسود', '#111111', 5, 0),
    (p_id, '28', 'أسود', '#111111', 6, 1),
    (p_id, '29', 'أسود', '#111111', 4, 2),
    (p_id, '30', 'أسود', '#111111', 2, 3);

  -- 5) Dino T-shirt (new arrival)
  insert into public.products (slug, category_id, name_ar, name_fr, name_en,
      description_ar, price, compare_at_price, is_active, delivery_days_min, delivery_days_max)
  values ('tshirt-dino',
      (select id from public.categories where slug='boys'),
      'تيشيرت الديناصور', 'T-shirt dino', 'Dino T-shirt',
      'تيشيرت قطني برسمة ديناصور.', 1900, 2400, true, 2, 5)
  returning id into p_id;
  insert into public.product_images (product_id, url, position) values
    (p_id, 'https://example.supabase.co/storage/v1/object/public/product-images/test/dino-tshirt-1.jpg', 0);
  insert into public.product_variants (product_id, size, color, color_hex, stock, position) values
    (p_id, '2Y', 'أبيض', '#ffffff', 7, 0),
    (p_id, '3Y', 'أبيض', '#ffffff', 8, 1),
    (p_id, '4Y', 'أبيض', '#ffffff', 6, 2);
end $$;

-- Test-only: a cheaper local wilaya, used by the pricing tests.
update public.delivery_fees set home_fee = 250, stopdesk_fee = 150 where wilaya_code = 10;
