const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let star;
let cursors;
const MOVE_SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillStar(50, 50, 5, 20, 40); // 中心点、点数、内半径、外半径
  
  // 生成纹理
  graphics.generateTexture('starTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建星形精灵，初始位置在画布中心
  star = this.add.sprite(400, 300, 'starTexture');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = MOVE_SPEED * (delta / 1000);
  
  // 根据方向键输入更新位置
  if (cursors.left.isDown) {
    star.x -= distance;
  }
  if (cursors.right.isDown) {
    star.x += distance;
  }
  if (cursors.up.isDown) {
    star.y -= distance;
  }
  if (cursors.down.isDown) {
    star.y += distance;
  }
  
  // 限制星形在画布边界内
  // 考虑星形的宽度和高度（纹理大小为 100x100）
  const halfWidth = star.width / 2;
  const halfHeight = star.height / 2;
  
  star.x = Phaser.Math.Clamp(star.x, halfWidth, config.width - halfWidth);
  star.y = Phaser.Math.Clamp(star.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);