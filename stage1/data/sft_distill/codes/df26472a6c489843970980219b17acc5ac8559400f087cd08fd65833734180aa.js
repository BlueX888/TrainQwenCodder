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

// 状态变量用于验证
let animationComplete = false;
let objectsShaking = 0;

function preload() {
  // 不需要加载外部资源
}

function create() {
  const scene = this;
  const objects = [];
  const colors = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff,
    0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xff0088,
    0x88ff00, 0x0088ff, 0xff8888, 0x88ff88, 0x8888ff
  ];
  
  // 创建15个物体的纹理
  for (let i = 0; i < 15; i++) {
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture(`ball${i}`, 50, 50);
    graphics.destroy();
  }
  
  // 以5x3网格排列创建15个精灵对象
  const startX = 150;
  const startY = 150;
  const spacingX = 120;
  const spacingY = 120;
  
  for (let i = 0; i < 15; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    const sprite = this.add.sprite(x, y, `ball${i}`);
    sprite.setData('originalX', x);
    sprite.setData('originalY', y);
    objects.push(sprite);
  }
  
  // 重置状态
  animationComplete = false;
  objectsShaking = 15;
  
  // 为所有物体创建同步抖动动画
  objects.forEach((obj, index) => {
    const originalX = obj.getData('originalX');
    const originalY = obj.getData('originalY');
    
    // 创建抖动动画 - 使用快速的 yoyo 循环来模拟抖动
    this.tweens.add({
      targets: obj,
      x: originalX + Phaser.Math.Between(-10, 10),
      y: originalY + Phaser.Math.Between(-10, 10),
      duration: 50, // 每次抖动持续50ms
      yoyo: true,
      repeat: 24, // 重复24次，总共 50ms * 2 * 25 = 2500ms
      ease: 'Linear',
      onComplete: () => {
        // 确保物体回到原始位置
        obj.setPosition(originalX, originalY);
        objectsShaking--;
        
        // 所有物体都完成动画
        if (objectsShaking === 0) {
          animationComplete = true;
          console.log('All objects finished shaking!');
          
          // 显示完成文本
          const text = scene.add.text(400, 500, 'Animation Complete!', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold'
          });
          text.setOrigin(0.5);
        }
      },
      onUpdate: (tween, target) => {
        // 在每次更新时随机改变位置以增强抖动效果
        if (tween.progress > 0 && tween.progress < 1) {
          const offsetX = Phaser.Math.Between(-8, 8);
          const offsetY = Phaser.Math.Between(-8, 8);
          target.x = originalX + offsetX;
          target.y = originalY + offsetY;
        }
      }
    });
  });
  
  // 添加标题文本
  const title = this.add.text(400, 50, '15 Objects Shaking for 2.5 seconds', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 添加状态显示
  const statusText = this.add.text(400, 550, '', {
    fontSize: '20px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);
  
  // 更新状态显示
  this.time.addEvent({
    delay: 100,
    callback: () => {
      statusText.setText(`Shaking: ${objectsShaking} | Complete: ${animationComplete}`);
    },
    loop: true
  });
}

const game = new Phaser.Game(config);