const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 方法1: 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制一个等边三角形（顶点朝上）
  const triangleSize = 40;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize);  // 顶点
  graphics.lineTo(-triangleSize, triangleSize);  // 左下角
  graphics.lineTo(triangleSize, triangleSize);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 设置初始位置在左侧
  graphics.x = 100;
  graphics.y = 300;
  
  // 创建补间动画：从左到右往返循环
  this.tweens.add({
    targets: graphics,
    x: 700,  // 目标位置（右侧）
    duration: 500,  // 0.5秒
    yoyo: true,  // 往返效果（到达终点后反向回到起点）
    loop: -1,  // 无限循环（-1 表示永久循环）
    ease: 'Linear'  // 线性缓动，匀速移动
  });
  
  // 添加文字说明
  this.add.text(400, 50, '白色三角形左右往返循环移动', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '循环周期: 1秒 (0.5秒向右 + 0.5秒向左)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);