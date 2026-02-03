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
  // 使用 Graphics 程序化生成橙色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制橙色圆形
  graphics.fillStyle(0xff8800, 1);
  graphics.fillCircle(50, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 100, 100);
  
  // 销毁临时 graphics 对象
  graphics.destroy();
}

function create() {
  // 创建橙色圆形精灵，放置在屏幕中央
  const circle = this.add.sprite(400, 300, 'orangeCircle');
  
  // 创建淡入淡出动画
  // duration: 2500ms (2.5秒) 完成一次淡入淡出
  // yoyo: true 表示动画会反向播放（淡入后淡出）
  // repeat: -1 表示无限循环
  this.tweens.add({
    targets: circle,
    alpha: 0,           // 目标透明度为 0（完全透明）
    duration: 1250,     // 单向动画时长 1.25 秒
    yoyo: true,         // 启用往返效果（淡入后淡出）
    repeat: -1,         // 无限循环
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数，使动画更平滑
  });
  
  // 添加文字说明
  this.add.text(400, 500, 'Orange Circle Fade In/Out Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);