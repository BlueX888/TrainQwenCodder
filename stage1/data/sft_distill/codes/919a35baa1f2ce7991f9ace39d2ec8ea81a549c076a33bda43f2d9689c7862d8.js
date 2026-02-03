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
  // 使用 Graphics 绘制菱形
  const graphics = this.add.graphics();
  
  // 设置菱形颜色
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制菱形（四个顶点坐标）
  // 中心点在 (50, 50)，菱形大小为 100x100
  graphics.beginPath();
  graphics.moveTo(50, 0);    // 上顶点
  graphics.lineTo(100, 50);  // 右顶点
  graphics.lineTo(50, 100);  // 下顶点
  graphics.lineTo(0, 50);    // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用菱形纹理的精灵
  const diamond = this.add.sprite(400, 300, 'diamond');
  
  // 设置精灵的原点为中心
  diamond.setOrigin(0.5, 0.5);
  
  // 创建缩放补间动画
  this.tweens.add({
    targets: diamond,           // 动画目标
    scaleX: 0.16,              // X轴缩放到16%
    scaleY: 0.16,              // Y轴缩放到16%
    duration: 2500,            // 持续时间2.5秒（2500毫秒）
    yoyo: true,                // 启用悠悠球效果（来回播放）
    loop: -1,                  // 无限循环（-1表示永久循环）
    ease: 'Linear'             // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, '菱形缩放动画：2.5秒缩放到16%后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);