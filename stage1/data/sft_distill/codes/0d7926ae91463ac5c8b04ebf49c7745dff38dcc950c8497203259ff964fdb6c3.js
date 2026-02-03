const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

let triangle;
let cursors;
const SPEED = 80;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制一个等边三角形（顶点朝上）
  // 中心点在 (25, 25)，半径约 20
  graphics.fillTriangle(
    25, 5,      // 顶点
    10, 35,     // 左下
    40, 35      // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 50, 50);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在画布中心
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 创建方向键监听
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    triangle.x -= distance;
  }
  if (cursors.right.isDown) {
    triangle.x += distance;
  }
  if (cursors.up.isDown) {
    triangle.y -= distance;
  }
  if (cursors.down.isDown) {
    triangle.y += distance;
  }
  
  // 限制在画布边界内
  // 考虑三角形纹理大小为 50x50，半径为 25
  const halfWidth = 25;
  const halfHeight = 25;
  
  triangle.x = Phaser.Math.Clamp(
    triangle.x,
    halfWidth,
    config.width - halfWidth
  );
  
  triangle.y = Phaser.Math.Clamp(
    triangle.y,
    halfHeight,
    config.height - halfHeight
  );
}

new Phaser.Game(config);