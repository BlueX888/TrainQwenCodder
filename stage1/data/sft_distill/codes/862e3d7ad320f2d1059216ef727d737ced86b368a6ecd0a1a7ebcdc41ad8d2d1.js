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
  // 创建青色椭圆
  const ellipse = this.add.ellipse(400, 200, 120, 80, 0x00ffff);
  
  // 创建弹跳动画
  this.tweens.add({
    targets: ellipse,
    y: 500, // 弹跳到的目标位置
    duration: 2000, // 2秒完成一次弹跳
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 来回运动
    repeat: -1, // 无限循环
    hold: 200 // 在底部停留200ms
  });
  
  // 添加说明文字
  this.add.text(400, 50, '弹跳的青色椭圆', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);