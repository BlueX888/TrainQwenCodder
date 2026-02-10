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
  // 使用 Graphics 绘制圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  
  // 生成纹理
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // 从原始大小(scale=1)缩放到24%(scale=0.24)，然后恢复
  // 使用 yoyo 实现往返效果，duration 为2000ms(2秒)
  this.tweens.add({
    targets: circle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 2000, // 2秒缩小到24%
    yoyo: true,     // 动画结束后反向播放（恢复原始大小）
    loop: -1,       // -1 表示无限循环
    ease: 'Linear'  // 线性缓动
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Circle scaling to 24% and back (2s loop)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);