class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevels = 8;
    this.levelTimeLimit = 2500; // 2.5秒，单位毫秒
    this.totalElapsedTime = 0; // 总用时
    this.levelStartTime = 0;
    this.timerEvent = null;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    this.gameOver = false;
    this.gameWon = false;
    this.currentLevel = 1;
    this.totalElapsedTime = 0;
    
    // 创建UI文本
    this.levelText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff'
    });
    
    this.timerText = this.add.text(20, 50, '', {
      fontSize: '20px',
      color: '#ffff00'
    });
    
    this.instructionText = this.add.text(400, 100, '', {
      fontSize: '18px',
      color: '#00ff00',
      align: 'center'
    }).setOrigin(0.5);
    
    this.totalTimeText = this.add.text(20, 80, '', {
      fontSize: '18px',
      color: '#00ffff'
    });
    
    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.gameOver || this.gameWon) return;
    
    // 清除旧的目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    
    // 更新关卡信息
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevels}`);
    this.instructionText.setText('点击绿色方块通关！');
    
    // 记录关卡开始时间
    this.levelStartTime = this.time.now;
    
    // 创建倒计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    
    this.timerEvent = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onTimeOut,
      callbackScope: this,
      loop: false
    });
    
    // 创建目标（绿色方块）
    const targetX = 200 + Math.random() * 400;
    const targetY = 200 + Math.random() * 200;
    const targetSize = 80 - this.currentLevel * 5; // 关卡越高，目标越小
    
    this.targetGraphics = this.add.graphics();
    this.targetGraphics.fillStyle(0x00ff00, 1);
    this.targetGraphics.fillRect(targetX - targetSize/2, targetY - targetSize/2, targetSize, targetSize);
    
    // 添加点击区域
    const hitArea = new Phaser.Geom.Rectangle(
      targetX - targetSize/2,
      targetY - targetSize/2,
      targetSize,
      targetSize
    );
    
    this.targetGraphics.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    this.targetGraphics.on('pointerdown', this.onTargetClick, this);
  }

  onTargetClick() {
    if (this.gameOver || this.gameWon) return;
    
    // 计算本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;
    
    // 移除倒计时器
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }
    
    // 检查是否通关
    if (this.currentLevel >= this.maxLevels) {
      this.onGameWon();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(300, () => {
        this.startLevel();
      });
    }
  }

  onTimeOut() {
    this.gameOver = true;
    
    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    
    // 显示失败信息
    this.instructionText.setText('时间到！游戏失败！\n\n点击屏幕重新开始');
    this.instructionText.setStyle({ fontSize: '32px', color: '#ff0000' });
    
    this.timerText.setText('');
    
    // 添加重新开始监听
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  onGameWon() {
    this.gameWon = true;
    
    // 清除目标
    if (this.targetGraphics) {
      this.targetGraphics.destroy();
    }
    
    // 显示胜利信息和总用时
    const totalSeconds = (this.totalElapsedTime / 1000).toFixed(2);
    this.instructionText.setText(
      `恭喜通关！\n\n总用时: ${totalSeconds} 秒\n\n点击屏幕重新开始`
    );
    this.instructionText.setStyle({ fontSize: '32px', color: '#ffff00' });
    
    this.timerText.setText('');
    this.levelText.setText('胜利！');
    
    // 添加重新开始监听
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) return;
    
    // 更新倒计时显示
    if (this.timerEvent) {
      const remaining = this.timerEvent.getRemaining();
      const remainingSeconds = (remaining / 1000).toFixed(2);
      this.timerText.setText(`剩余时间: ${remainingSeconds} 秒`);
      
      // 时间不足1秒时变红
      if (remaining < 1000) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#ffff00');
      }
    }
    
    // 更新总用时显示
    const currentTotal = this.totalElapsedTime + (this.time.now - this.levelStartTime);
    const totalSeconds = (currentTotal / 1000).toFixed(2);
    this.totalTimeText.setText(`累计用时: ${totalSeconds} 秒`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);