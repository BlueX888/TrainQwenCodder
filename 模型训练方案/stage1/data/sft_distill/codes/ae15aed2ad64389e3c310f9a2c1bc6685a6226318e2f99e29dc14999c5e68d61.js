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
  // 使用 Graphics 绘制紫色矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('purpleRect', 100, 100);
  graphics.destroy();

  // 创建矩形精灵，放置在屏幕中央上方
  const rect = this.add.sprite(400, 150, 'purpleRect');

  // 创建弹跳动画
  // 从当前位置向下弹跳到 y=450，然后返回，循环播放
  this.tweens.add({
    targets: rect,
    y: 450, // 弹跳到的目标位置
    duration: 1250, // 单程 1.25 秒
    ease: 'Bounce.Out', // 弹跳缓动效果
    yoyo: true, // 返回原位置
    repeat: -1, // 无限循环
    hold: 0, // 到达目标后不停留
    repeatDelay: 0 // 重复之间无延迟
  });

  // 添加提示文本
  this.add.text(400, 550, 'Purple Rectangle Bounce Animation', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);