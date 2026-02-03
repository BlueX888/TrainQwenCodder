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
  // 使用 Graphics 创建橙色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 200, 150);
  
  // 生成纹理
  graphics.generateTexture('orangeRect', 200, 150);
  graphics.destroy(); // 销毁 graphics 对象，纹理已保存
  
  // 创建 Sprite 对象，位置居中
  const rect = this.add.sprite(400, 300, 'orangeRect');
  
  // 设置初始透明度为 0（完全透明）
  rect.setAlpha(0);
  
  // 创建淡入淡出 Tween 动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    alpha: 1,                // 目标透明度值（淡入到完全不透明）
    duration: 500,           // 单次动画持续时间 500ms（0.5秒）
    yoyo: true,              // 启用 yoyo 效果（淡入后自动淡出）
    repeat: -1,              // 无限循环（-1 表示永久重复）
    ease: 'Linear'           // 使用线性缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 500, '橙色矩形淡入淡出循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);