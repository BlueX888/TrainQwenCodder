const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形（中心对齐）
  const triangleSize = 100;
  graphics.beginPath();
  graphics.moveTo(0, -triangleSize / 2); // 顶点
  graphics.lineTo(-triangleSize / 2, triangleSize / 2); // 左下角
  graphics.lineTo(triangleSize / 2, triangleSize / 2); // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 将 Graphics 生成为纹理
  graphics.generateTexture('triangle', triangleSize, triangleSize);
  
  // 销毁 Graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建使用三角形纹理的 Sprite，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.32, // 缩放到 32%
    scaleY: 0.32, // 缩放到 32%
    duration: 2000, // 2 秒缩小
    yoyo: true, // 反向播放（恢复原始大小）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Triangle Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scaling from 100% to 32% and back (4s cycle)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

// 创建 Phaser 游戏实例
new Phaser.Game(config);