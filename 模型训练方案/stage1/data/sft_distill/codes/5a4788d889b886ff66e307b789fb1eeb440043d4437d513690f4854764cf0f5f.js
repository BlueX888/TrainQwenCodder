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
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  graphics.generateTexture('redSquare', 80, 80);
  graphics.destroy();
}

function create() {
  // 创建红色方块精灵
  const redSquare = this.add.sprite(400, 500, 'redSquare');
  
  // 添加弹跳动画
  // 从当前位置向上移动 200 像素，然后返回，整个过程 2 秒
  this.tweens.add({
    targets: redSquare,
    y: 300, // 向上弹跳到的位置
    duration: 1000, // 单程 1 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 往返运动
    repeat: -1, // 无限循环
    repeatDelay: 0 // 无延迟立即重复
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Bouncing Red Square', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);