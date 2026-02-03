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
let keys;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1);
  graphics.lineStyle(2, 0xffa500, 1);
  
  // 绘制星形（五角星）
  // 参数：x, y, points(角数), innerRadius(内半径), outerRadius(外半径)
  graphics.fillStar(50, 50, 5, 20, 40);
  graphics.strokeStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中央
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 设置键盘输入 - 使用 WASD 键
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Use WASD keys to move the star', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算每帧移动距离 = 速度 * 时间间隔（转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 检测 W 键（向上）
  if (keys.w.isDown) {
    star.y -= distance;
  }
  
  // 检测 S 键（向下）
  if (keys.s.isDown) {
    star.y += distance;
  }
  
  // 检测 A 键（向左）
  if (keys.a.isDown) {
    star.x -= distance;
  }
  
  // 检测 D 键（向右）
  if (keys.d.isDown) {
    star.x += distance;
  }
  
  // 边界限制（可选）- 防止星形完全移出屏幕
  star.x = Phaser.Math.Clamp(star.x, 0, 800);
  star.y = Phaser.Math.Clamp(star.y, 0, 600);
}

new Phaser.Game(config);