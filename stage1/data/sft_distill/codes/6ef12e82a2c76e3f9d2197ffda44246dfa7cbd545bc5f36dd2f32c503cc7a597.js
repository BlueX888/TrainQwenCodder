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
  // 使用 Graphics 绘制紫色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径 50 的圆
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('purpleCircle', 100, 100);
  graphics.destroy(); // 销毁 Graphics 对象，因为已经生成纹理
  
  // 在屏幕中心创建紫色圆形精灵
  const circle = this.add.sprite(400, 300, 'purpleCircle');
  
  // 创建闪烁动画
  // 使用 yoyo 模式：透明度从 1 降到 0，再从 0 升到 1，完成一次完整闪烁
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 0,                  // 目标透明度值
    duration: 750,             // 单程持续时间 750ms（总共 1.5 秒）
    yoyo: true,                // 启用 yoyo 模式，动画会反向播放
    repeat: -1,                // -1 表示无限循环
    ease: 'Sine.easeInOut'     // 缓动函数，使闪烁更自然
  });
  
  // 添加提示文本
  this.add.text(400, 500, '紫色圆形闪烁动画 (1.5秒/次)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);