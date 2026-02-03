const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let diamond;
let cursors;
const SPEED = 240;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制菱形路径（中心点为原点）
  const size = 32;
  graphics.beginPath();
  graphics.moveTo(0, -size);      // 顶点
  graphics.lineTo(size, 0);       // 右点
  graphics.lineTo(0, size);       // 底点
  graphics.lineTo(-size, 0);      // 左点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamondTex', size * 2, size * 2);
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在画布中心
  diamond = this.add.sprite(400, 300, 'diamondTex');
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算移动距离（速度 * 时间差，转换为秒）
  const distance = SPEED * (delta / 1000);
  
  // 根据方向键更新位置
  if (cursors.left.isDown) {
    diamond.x -= distance;
  }
  if (cursors.right.isDown) {
    diamond.x += distance;
  }
  if (cursors.up.isDown) {
    diamond.y -= distance;
  }
  if (cursors.down.isDown) {
    diamond.y += distance;
  }
  
  // 限制在画布边界内（考虑菱形的宽高）
  const halfWidth = diamond.width / 2;
  const halfHeight = diamond.height / 2;
  
  diamond.x = Phaser.Math.Clamp(diamond.x, halfWidth, config.width - halfWidth);
  diamond.y = Phaser.Math.Clamp(diamond.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);