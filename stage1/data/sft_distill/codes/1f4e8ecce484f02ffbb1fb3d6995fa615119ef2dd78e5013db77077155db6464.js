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

let star;
let cursors;
const SPEED = 240;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  
  // 创建星形路径
  const starShape = new Phaser.Geom.Star(32, 32, 5, 16, 32);
  graphics.fillPoints(starShape.points, true);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 设置 WASD 键盘输入
  cursors = {
    w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
  };
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD to move the star', {
    fontSize: '18px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间（秒）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测 WASD 键状态
  if (cursors.w.isDown) {
    velocityY = -1;
  }
  if (cursors.s.isDown) {
    velocityY = 1;
  }
  if (cursors.a.isDown) {
    velocityX = -1;
  }
  if (cursors.d.isDown) {
    velocityX = 1;
  }
  
  // 如果同时按下多个键，进行归一化处理（斜向移动速度一致）
  if (velocityX !== 0 && velocityY !== 0) {
    const magnitude = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= magnitude;
    velocityY /= magnitude;
  }
  
  // 更新星形位置
  star.x += velocityX * distance;
  star.y += velocityY * distance;
  
  // 边界限制（可选）
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);