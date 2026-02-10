const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let animationComplete = false;
let completedCount = 0;
let objects = [];

function preload() {
  // 无需预加载外部资源
}

function create() {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
  const startX = 100;
  const spacing = 140;
  
  // 创建5个彩色方块
  for (let i = 0; i < 5; i++) {
    // 使用Graphics创建方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(colors[i], 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(`box${i}`, 80, 80);
    graphics.destroy();
    
    // 创建精灵对象
    const box = this.add.sprite(startX + i * spacing, 300, `box${i}`);
    box.setOrigin(0.5, 0.5);
    objects.push(box);
    
    // 创建缩放动画
    this.tweens.add({
      targets: box,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      ease: 'Power2',
      onComplete: () => {
        completedCount++;
        // 当所有5个动画都完成时，设置状态变量
        if (completedCount === 5) {
          animationComplete = true;
          console.log('All animations completed!');
        }
      }
    });
  }
  
  // 添加文本显示状态
  this.statusText = this.add.text(400, 50, 'Animation Status: Running', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  this.statusText.setOrigin(0.5, 0.5);
  
  this.counterText = this.add.text(400, 100, `Completed: ${completedCount}/5`, {
    fontSize: '20px',
    color: '#00ff00',
    align: 'center'
  });
  this.counterText.setOrigin(0.5, 0.5);
  
  // 添加说明文本
  this.add.text(400, 550, '5 objects scaling synchronously for 0.5 seconds', {
    fontSize: '18px',
    color: '#aaaaaa',
    align: 'center'
  }).setOrigin(0.5, 0.5);
}

function update() {
  // 更新状态显示
  if (this.statusText) {
    if (animationComplete) {
      this.statusText.setText('Animation Status: Completed');
      this.statusText.setColor('#00ff00');
    }
    this.counterText.setText(`Completed: ${completedCount}/5`);
  }
  
  // 验证所有对象的缩放值
  if (animationComplete) {
    let allScaled = true;
    for (let obj of objects) {
      if (Math.abs(obj.scaleX - 2) > 0.01 || Math.abs(obj.scaleY - 2) > 0.01) {
        allScaled = false;
        break;
      }
    }
    
    // 输出验证信息（仅一次）
    if (allScaled && !this.verified) {
      this.verified = true;
      console.log('Verification: All objects scaled to 2x successfully');
      console.log('State - animationComplete:', animationComplete);
      console.log('State - completedCount:', completedCount);
    }
  }
}

const game = new Phaser.Game(config);