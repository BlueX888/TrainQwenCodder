class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.animationComplete = false; // 状态信号：动画是否完成
    this.objectsCreated = 0; // 状态信号：创建的物体数量
  }

  preload() {
    // 程序化生成3个不同颜色的纹理
    this.createTexture('box1', 0xff0000); // 红色
    this.createTexture('box2', 0x00ff00); // 绿色
    this.createTexture('box3', 0x0000ff); // 蓝色
  }

  createTexture(key, color) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 80, 80);
    graphics.generateTexture(key, 80, 80);
    graphics.destroy();
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    
    // 创建3个物体，水平排列
    const spacing = 150;
    const objects = [];
    
    // 物体1 - 红色
    const obj1 = this.add.sprite(centerX - spacing, centerY, 'box1');
    obj1.setOrigin(0.5);
    objects.push(obj1);
    this.objectsCreated++;
    
    // 物体2 - 绿色
    const obj2 = this.add.sprite(centerX, centerY, 'box2');
    obj2.setOrigin(0.5);
    objects.push(obj2);
    this.objectsCreated++;
    
    // 物体3 - 蓝色
    const obj3 = this.add.sprite(centerX + spacing, centerY, 'box3');
    obj3.setOrigin(0.5);
    objects.push(obj3);
    this.objectsCreated++;
    
    // 添加标题文本
    this.add.text(centerX, 50, '同步缩放动画 (2.5秒)', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 状态文本
    this.statusText = this.add.text(centerX, this.cameras.main.height - 50, 
      '状态: 动画进行中...', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // 创建同步缩放动画
    const tweens = [];
    
    objects.forEach((obj, index) => {
      const tween = this.tweens.add({
        targets: obj,
        scaleX: 2,
        scaleY: 2,
        duration: 1250, // 2.5秒的一半（因为有yoyo效果）
        ease: 'Sine.easeInOut',
        yoyo: true, // 缩放后返回原始大小
        onComplete: () => {
          // 只在第一个动画完成时更新状态
          if (index === 0) {
            this.animationComplete = true;
            this.statusText.setText(
              `状态: 动画完成! (物体数: ${this.objectsCreated})`
            );
            this.statusText.setColor('#00ff00');
            
            // 在控制台输出验证信息
            console.log('Animation completed!');
            console.log('Objects created:', this.objectsCreated);
            console.log('Animation complete status:', this.animationComplete);
          }
        }
      });
      
      tweens.push(tween);
    });
    
    // 添加计时器文本显示剩余时间
    this.timerText = this.add.text(centerX, 100, '剩余时间: 2.5s', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 创建计时器
    this.startTime = this.time.now;
    this.animationDuration = 2500; // 2.5秒
  }

  update(time, delta) {
    // 更新计时器显示
    if (!this.animationComplete) {
      const elapsed = time - this.startTime;
      const remaining = Math.max(0, (this.animationDuration - elapsed) / 1000);
      this.timerText.setText(`剩余时间: ${remaining.toFixed(2)}s`);
      
      if (remaining === 0 && this.timerText) {
        this.timerText.setText('剩余时间: 0.00s');
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    animationComplete: scene.animationComplete,
    objectsCreated: scene.objectsCreated
  };
};