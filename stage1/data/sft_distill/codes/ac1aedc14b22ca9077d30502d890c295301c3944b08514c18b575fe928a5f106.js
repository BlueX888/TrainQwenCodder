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
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(50, 50, 50); // 半径50的圆形
  
  // 生成纹理
  graphics.generateTexture('grayCircle', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象
  const circle = this.add.sprite(400, 300, 'grayCircle');
  
  // 创建抖动动画
  // 使用多个关键帧实现快速抖动效果
  this.tweens.add({
    targets: circle,
    x: {
      from: 400,
      to: 400,
      duration: 500,
      ease: 'Linear'
    },
    props: {
      x: {
        value: '+=10',
        duration: 50,
        yoyo: true,
        repeat: 4 // 在 0.5 秒内重复 5 次（共 10 个动作）
      }
    },
    loop: -1, // 无限循环
    onLoop: function() {
      // 每次循环开始时重置位置
      circle.x = 400;
    }
  });
  
  // 添加替代方案：使用时间轴实现更精确的抖动
  this.tweens.timeline({
    targets: circle,
    loop: -1,
    tweens: [
      { x: 410, duration: 50, ease: 'Linear' },
      { x: 390, duration: 50, ease: 'Linear' },
      { x: 410, duration: 50, ease: 'Linear' },
      { x: 390, duration: 50, ease: 'Linear' },
      { x: 410, duration: 50, ease: 'Linear' },
      { x: 390, duration: 50, ease: 'Linear' },
      { x: 410, duration: 50, ease: 'Linear' },
      { x: 390, duration: 50, ease: 'Linear' },
      { x: 410, duration: 50, ease: 'Linear' },
      { x: 400, duration: 50, ease: 'Linear' } // 回到中心位置
    ]
  });
  
  // 添加文字说明
  this.add.text(400, 500, '灰色圆形抖动动画 (0.5秒循环)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);