class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.animationActive = false; // 动画状态标志
    this.bounceCount = 0; // 弹跳计数器
    this.objectsCreated = 0; // 创建的物体数量
  }

  preload() {
    // 创建圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('ball', 40, 40);
    graphics.destroy();
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 存储所有物体和补间动画
    this.balls = [];
    this.tweens = [];
    
    // 创建15个球形物体，排列成3行5列
    const cols = 5;
    const rows = 3;
    const spacing = 120;
    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = (height - (rows - 1) * spacing) / 2;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        
        // 创建球形精灵
        const ball = this.add.sprite(x, y, 'ball');
        ball.setTint(Phaser.Display.Color.GetColor(
          100 + row * 50,
          150 + col * 20,
          200 + (row + col) * 10
        ));
        
        this.balls.push(ball);
        this.objectsCreated++;
      }
    }
    
    // 启动同步弹跳动画
    this.startBounceAnimation();
    
    // 2秒后停止动画
    this.time.delayedCall(2000, () => {
      this.stopBounceAnimation();
    });
    
    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  startBounceAnimation() {
    this.animationActive = true;
    
    // 为所有球创建同步的弹跳动画
    this.balls.forEach((ball, index) => {
      const tween = this.tweens.add({
        targets: ball,
        y: ball.y - 80, // 向上弹跳80像素
        duration: 400, // 单次弹跳持续400ms
        ease: 'Sine.easeInOut',
        yoyo: true, // 自动返回原位
        repeat: -1, // 无限重复
        onYoyo: () => {
          // 只在第一个球触底时增加计数
          if (index === 0) {
            this.bounceCount++;
            this.updateStatusText();
          }
        }
      });
      
      this.tweens.push(tween);
    });
  }

  stopBounceAnimation() {
    this.animationActive = false;
    
    // 停止所有补间动画
    this.tweens.forEach(tween => {
      tween.stop();
    });
    
    // 将所有球平滑归位到初始位置
    this.balls.forEach(ball => {
      this.tweens.add({
        targets: ball,
        y: ball.getData('initialY') || ball.y,
        duration: 300,
        ease: 'Sine.easeOut'
      });
    });
    
    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.animationActive ? '运行中' : '已停止';
    this.statusText.setText([
      `物体数量: ${this.objectsCreated}`,
      `弹跳次数: ${this.bounceCount}`,
      `动画状态: ${status}`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: BounceScene
};

new Phaser.Game(config);