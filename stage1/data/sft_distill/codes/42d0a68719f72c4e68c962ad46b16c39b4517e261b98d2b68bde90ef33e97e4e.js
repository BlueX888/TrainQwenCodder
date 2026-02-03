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
  // 使用 Graphics 生成蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1); // 蓝色
  graphics.fillRect(0, 0, 100, 100);
  graphics.generateTexture('blueBox', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建蓝色方块精灵，放置在屏幕中央
  const blueBox = this.add.sprite(400, 300, 'blueBox');
  
  // 创建闪烁动画效果
  // 通过改变 alpha 值实现闪烁：1 -> 0 -> 1
  this.tweens.add({
    targets: blueBox,
    alpha: 0, // 目标透明度为0（完全透明）
    duration: 750, // 单程时间750ms
    yoyo: true, // 启用往返效果（0->1->0变为1->0->1）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动函数使闪烁更自然
  });
  
  // 添加提示文本
  this.add.text(400, 500, '蓝色方块闪烁动画（1.5秒/次）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);