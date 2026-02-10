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
  // 使用 Graphics 绘制黄色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 60, 40); // 矩形尺寸：60x40
  
  // 生成纹理
  graphics.generateTexture('yellowRect', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const rect = this.add.sprite(100, 300, 'yellowRect');
  
  // 创建补间动画
  this.tweens.add({
    targets: rect,           // 目标对象
    x: 700,                  // 移动到右侧位置（800 - 100）
    duration: 4000,          // 持续时间 4 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 往返效果（到达终点后反向播放）
    loop: -1,                // 无限循环（-1 表示永久循环）
    repeat: 0                // yoyo 模式下不需要额外 repeat
  });
  
  // 添加提示文字
  this.add.text(10, 10, 'Yellow rectangle moving left-right (4s cycle)', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);