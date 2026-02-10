const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;
let keys;
const SPEED = 120; // 像素/秒

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建椭圆图形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillEllipse(0, 0, 60, 40); // 中心点为 (0,0)，宽 60，高 40
  
  // 生成纹理并创建精灵
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy();
  
  // 创建椭圆精灵并设置初始位置
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间，delta 单位是毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动椭圆
  if (keys.w.isDown) {
    ellipse.y -= distance;
  }
  if (keys.s.isDown) {
    ellipse.y += distance;
  }
  if (keys.a.isDown) {
    ellipse.x -= distance;
  }
  if (keys.d.isDown) {
    ellipse.x += distance;
  }
  
  // 边界限制（可选）
  ellipse.x = Phaser.Math.Clamp(ellipse.x, 0, 800);
  ellipse.y = Phaser.Math.Clamp(ellipse.y, 0, 600);
}

new Phaser.Game(config);