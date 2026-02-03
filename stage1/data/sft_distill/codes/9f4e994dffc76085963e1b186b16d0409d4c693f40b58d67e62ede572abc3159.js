const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let diamond;
let keys;
const SPEED = 200; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  
  // 创建菱形路径（中心点为原点）
  const size = 40;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 上顶点
  graphics.lineTo(size, 0);       // 右顶点
  graphics.lineTo(0, size);       // 下顶点
  graphics.lineTo(-size, 0);      // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，放置在屏幕中央
  diamond = this.add.sprite(400, 300, 'diamond');
  
  // 添加 WASD 键监听
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间差，delta 单位是毫秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据按键状态移动菱形
  if (keys.w.isDown) {
    diamond.y -= distance; // 向上移动
  }
  if (keys.s.isDown) {
    diamond.y += distance; // 向下移动
  }
  if (keys.a.isDown) {
    diamond.x -= distance; // 向左移动
  }
  if (keys.d.isDown) {
    diamond.x += distance; // 向右移动
  }
}

new Phaser.Game(config);