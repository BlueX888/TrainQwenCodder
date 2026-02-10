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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const rect = this.add.sprite(400, 200, 'purpleRect');
  
  // 创建弹跳动画
  this.tweens.add({
    targets: rect,
    y: 500, // 弹跳到的目标位置
    duration: 2500, // 2.5 秒
    ease: 'Bounce.easeOut', // 弹跳缓动效果
    yoyo: true, // 来回运动
    repeat: -1, // 无限循环
    hold: 0 // 到达目标后立即返回
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Purple Rectangle Bounce Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 580, 'Loop: 2.5s per bounce cycle', {
    fontSize: '16px',
    color: '#888888'
  }).setOrigin(0.5);
}

new Phaser.Game(config);