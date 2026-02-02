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
  // 使用 Graphics 绘制青色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 60, 60); // 60x60 的矩形
  
  // 生成纹理
  graphics.generateTexture('cyanRect', 60, 60);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'cyanRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,
    x: 700, // 移动到右侧（800 - 100 = 700）
    duration: 2500, // 2.5 秒
    ease: 'Linear', // 线性缓动
    yoyo: true, // 启用往返效果
    loop: -1 // 无限循环（-1 表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(10, 10, 'Cyan rectangle moving left-right in 2.5s loop', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);