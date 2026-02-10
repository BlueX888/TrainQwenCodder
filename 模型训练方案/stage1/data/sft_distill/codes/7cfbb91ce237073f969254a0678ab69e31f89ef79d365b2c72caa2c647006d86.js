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
  // 方案1: 使用 Rectangle GameObject
  const rect = this.add.rectangle(400, 300, 100, 100, 0xff0000);
  
  // 创建缩放动画
  // 从原始大小缩放到1.5倍，然后返回，循环播放
  this.tweens.add({
    targets: rect,
    scaleX: 1.5,
    scaleY: 1.5,
    duration: 1000,      // 放大1秒
    yoyo: true,          // 自动返回原始值（再花1秒缩小）
    repeat: -1,          // 无限循环
    ease: 'Sine.easeInOut'  // 平滑的缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, '红色矩形缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);