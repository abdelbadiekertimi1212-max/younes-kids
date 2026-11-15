-- ============================================================
-- Younes Kids — seed data
-- Safe to re-run (uses ON CONFLICT / guards).
-- ============================================================

-- ---------------- Categories ----------------
insert into public.categories (slug, name_ar, name_fr, name_en, position) values
  ('baby',        'رضّع',              'Bébé',             'Baby',               1),
  ('girls',       'بنات',              'Filles',           'Girls',              2),
  ('boys',        'أولاد',             'Garçons',          'Boys',               3),
  ('pyjamas',     'بيجامات',           'Pyjamas',          'Pyjamas',            4),
  ('shoes',       'أحذية',             'Chaussures',       'Shoes',              5),
  ('accessories', 'إكسسوارات',         'Accessoires',      'Accessories',        6)
on conflict (slug) do nothing;

-- ---------------- Settings ----------------
insert into public.settings (key, value, is_public) values
  ('store',    '{"name":"Younes Kids","phone":"","email":"","city":""}', true),
  ('social',   '{"instagram":"","facebook":"","tiktok":"","whatsapp":""}', true),
  ('policies', '{"exchange_days":3,"return_days":3,"exchange_ar":"إمكانية الاستبدال خلال 3 أيام من الاستلام","exchange_fr":"Échange possible sous 3 jours","exchange_en":"Exchange within 3 days"}', true),
  ('delivery', '{"free_threshold":0,"default_days_min":2,"default_days_max":5}', true)
on conflict (key) do nothing;

-- ---------------- Cancellation reasons ----------------
insert into public.cancellation_reasons (label_ar, label_fr, label_en, position) values
  ('لم يرد على الهاتف',     'Ne répond pas',      'No answer',          1),
  ('تراجع عن الطلب',        'A changé d''avis',   'Changed their mind', 2),
  ('السعر مرتفع',           'Prix trop élevé',    'Price too high',     3),
  ('رقم هاتف خاطئ',         'Mauvais numéro',     'Wrong phone number', 4),
  ('طلب مكرّر',             'Commande en double', 'Duplicate order',    5),
  ('مدة التوصيل طويلة',     'Délai trop long',    'Delivery too long',  6),
  ('سبب آخر',               'Autre',              'Other',              7)
on conflict do nothing;

-- ---------------- Return reasons ----------------
insert into public.return_reasons (label_ar, label_fr, label_en, position) values
  ('المقاس غير مناسب',      'Mauvaise taille',    'Wrong size',        1),
  ('غير مطابق للوصف',       'Non conforme',       'Not as described',  2),
  ('منتج تالف',             'Produit endommagé',  'Damaged product',   3),
  ('تغيّر الرأي',           'A changé d''avis',   'Changed their mind', 4),
  ('سبب آخر',               'Autre',              'Other',             5)
on conflict do nothing;

-- ---------------- Delivery fees: 58 wilayas ----------------
insert into public.delivery_fees (wilaya_code, name_ar, name_fr) values
  (1,'أدرار','Adrar'),(2,'الشلف','Chlef'),(3,'الأغواط','Laghouat'),
  (4,'أم البواقي','Oum El Bouaghi'),(5,'باتنة','Batna'),(6,'بجاية','Béjaïa'),
  (7,'بسكرة','Biskra'),(8,'بشار','Béchar'),(9,'البليدة','Blida'),
  (10,'البويرة','Bouira'),(11,'تمنراست','Tamanrasset'),(12,'تبسة','Tébessa'),
  (13,'تلمسان','Tlemcen'),(14,'تيارت','Tiaret'),(15,'تيزي وزو','Tizi Ouzou'),
  (16,'الجزائر','Alger'),(17,'الجلفة','Djelfa'),(18,'جيجل','Jijel'),
  (19,'سطيف','Sétif'),(20,'سعيدة','Saïda'),(21,'سكيكدة','Skikda'),
  (22,'سيدي بلعباس','Sidi Bel Abbès'),(23,'عنابة','Annaba'),(24,'قالمة','Guelma'),
  (25,'قسنطينة','Constantine'),(26,'المدية','Médéa'),(27,'مستغانم','Mostaganem'),
  (28,'المسيلة','M''Sila'),(29,'معسكر','Mascara'),(30,'ورقلة','Ouargla'),
  (31,'وهران','Oran'),(32,'البيض','El Bayadh'),(33,'إليزي','Illizi'),
  (34,'برج بوعريريج','Bordj Bou Arréridj'),(35,'بومرداس','Boumerdès'),(36,'الطارف','El Tarf'),
  (37,'تندوف','Tindouf'),(38,'تيسمسيلت','Tissemsilt'),(39,'الوادي','El Oued'),
  (40,'خنشلة','Khenchela'),(41,'سوق أهراس','Souk Ahras'),(42,'تيبازة','Tipaza'),
  (43,'ميلة','Mila'),(44,'عين الدفلى','Aïn Defla'),(45,'النعامة','Naâma'),
  (46,'عين تموشنت','Aïn Témouchent'),(47,'غرداية','Ghardaïa'),(48,'غليزان','Relizane'),
  (49,'تيميمون','Timimoun'),(50,'برج باجي مختار','Bordj Badji Mokhtar'),
  (51,'أولاد جلال','Ouled Djellal'),(52,'بني عباس','Béni Abbès'),
  (53,'عين صالح','In Salah'),(54,'عين قزام','In Guezzam'),(55,'تقرت','Touggourt'),
  (56,'جانت','Djanet'),(57,'المغير','El M''Ghair'),(58,'المنيعة','El Meniaa')
on conflict (wilaya_code) do nothing;

-- Default tiers: north/central 500/300, deep south 800/500, home wilaya cheaper
update public.delivery_fees set home_fee = 500, stopdesk_fee = 300;
update public.delivery_fees set home_fee = 800, stopdesk_fee = 500
  where wilaya_code in (1,3,7,8,11,30,32,33,37,39,45,47,49,50,51,52,53,54,55,56,57,58);

-- ---------------- Demo products ----------------
-- Idempotent: only seed when there are no products yet.
