const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let hexagon;
let cursors;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制六边形
  const graphics = this.add.graphics();
  
  // 绘制黄色六边形
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.lineStyle(2, 0xffd700, 1); // 金色边框
  
  // 六边形参数
  const size = 30; // 六边形大小
  const centerX = 32; // 纹理中心X
  const centerY = 32; // 纹理中心Y
  
  // 绘制六边形（6个顶点）
  graphics.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 每个顶点间隔60度
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    
    if (i === 0) {
      graphics.moveTo(x, y);
    } else {
      graphics.lineTo(x, y);
    }
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', 64, 64);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建六边形精灵，位置在画布中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 将 delta 转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算移动距离
  const moveDistance = SPEED * deltaInSeconds;
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 检测方向键输入
  if (cursors.left.isDown) {
    velocityX = -1;
  } else if (cursors.right.isDown) {
    velocityX = 1;
  }
  
  if (cursors.up.isDown) {
    velocityY = -1;
  } else if (cursors.down.isDown) {
    velocityY = 1;
  }
  
  // 归一化对角线移动速度
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新位置
  hexagon.x += velocityX * moveDistance;
  hexagon.y += velocityY * moveDistance;
  
  // 限制在画布边界内
  const halfWidth = hexagon.width / 2;
  const halfHeight = hexagon.height / 2;
  
  hexagon.x = Phaser.Math.Clamp(hexagon.x, halfWidth, config.width - halfWidth);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, halfHeight, config.height - halfHeight);
}

new Phaser.Game(config);