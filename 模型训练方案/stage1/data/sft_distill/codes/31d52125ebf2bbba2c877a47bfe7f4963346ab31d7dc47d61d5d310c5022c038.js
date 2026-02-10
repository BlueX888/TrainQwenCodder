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
  // 使用 Graphics 绘制灰色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 100, 100);
  
  // 生成纹理
  graphics.generateTexture('graySquare', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 在场景中心创建方块精灵
  const square = this.add.sprite(400, 300, 'graySquare');
  
  // 设置精灵的原点为中心（默认就是 0.5, 0.5）
  square.setOrigin(0.5, 0.5);
  
  // 创建旋转动画
  this.tweens.add({
    targets: square,           // 动画目标对象
    rotation: Math.PI * 2,     // 旋转角度：2π 弧度（360度）
    duration: 1500,            // 持续时间：1.5秒
    ease: 'Linear',            // 线性缓动，匀速旋转
    repeat: -1,                // 无限循环（-1 表示永久重复）
    yoyo: false                // 不使用往返效果
  });
}

// 启动游戏
new Phaser.Game(config);