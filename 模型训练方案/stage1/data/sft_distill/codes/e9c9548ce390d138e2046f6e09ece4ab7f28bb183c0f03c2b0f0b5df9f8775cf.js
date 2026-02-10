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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（居中绘制，方便缩放）
  graphics.beginPath();
  graphics.moveTo(0, -50);      // 顶点
  graphics.lineTo(-43, 25);     // 左下角
  graphics.lineTo(43, 25);      // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 86, 75);
  graphics.destroy();
  
  // 创建三角形精灵
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    scaleX: 0.8,                // X 轴缩放到 80%
    scaleY: 0.8,                // Y 轴缩放到 80%
    duration: 500,              // 持续时间 0.5 秒
    yoyo: true,                 // 动画结束后反向播放（回到原始大小）
    loop: -1,                   // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'      // 缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, '三角形循环缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);