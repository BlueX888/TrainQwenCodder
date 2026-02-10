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
  // 使用 Graphics 绘制红色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 80, 80);
  
  // 生成纹理
  graphics.generateTexture('redSquare', 80, 80);
  graphics.destroy();
  
  // 创建红色方块精灵
  const redSquare = this.add.image(400, 500, 'redSquare');
  
  // 创建弹跳动画
  // 从当前位置向上移动到 y=200，然后返回，形成弹跳效果
  this.tweens.add({
    targets: redSquare,
    y: 200,                    // 目标 y 坐标（向上弹跳）
    duration: 1000,            // 上升时间 1 秒
    ease: 'Cubic.easeOut',     // 上升时的缓动
    yoyo: true,                // 返回原位置
    yoyoEase: 'Bounce.easeOut', // 下落时使用弹跳效果
    repeat: -1,                // 无限循环
    repeatDelay: 0             // 无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Bouncing Red Square', {
    fontSize: '32px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 100, '2-second bounce cycle (loop)', {
    fontSize: '20px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);