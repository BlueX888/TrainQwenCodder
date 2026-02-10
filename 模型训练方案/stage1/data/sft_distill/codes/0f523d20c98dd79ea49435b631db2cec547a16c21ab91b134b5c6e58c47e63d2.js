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
  // 使用 Graphics 创建三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制三角形
  graphics.fillStyle(0x00ff00, 1);
  graphics.beginPath();
  graphics.moveTo(50, 0);      // 顶点
  graphics.lineTo(100, 100);   // 右下
  graphics.lineTo(0, 100);     // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵并居中显示
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,
    scaleX: 0.16,
    scaleY: 0.16,
    duration: 2500,      // 2.5秒
    yoyo: true,          // 动画结束后反向播放（恢复原始大小）
    loop: -1,            // 无限循环
    ease: 'Linear'       // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Triangle scaling to 16% and back (2.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);