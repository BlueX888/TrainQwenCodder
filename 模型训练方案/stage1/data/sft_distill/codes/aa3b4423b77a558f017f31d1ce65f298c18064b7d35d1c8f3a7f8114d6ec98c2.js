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
  // 使用 Graphics 创建红色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制红色三角形
  graphics.fillStyle(0xff0000, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 100);   // 右下角
  graphics.lineTo(0, 100);     // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('redTriangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，放置在屏幕中央
  const triangle = this.add.sprite(400, 300, 'redTriangle');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现淡入后淡出，repeat: -1 实现无限循环
  this.tweens.add({
    targets: triangle,
    alpha: 0,              // 目标透明度为0（完全透明）
    duration: 1250,        // 单程时间1.25秒
    yoyo: true,            // 启用yoyo效果，动画结束后反向播放
    repeat: -1,            // 无限循环
    ease: 'Linear'         // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 500, '红色三角形淡入淡出循环动画 (2.5秒/周期)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);