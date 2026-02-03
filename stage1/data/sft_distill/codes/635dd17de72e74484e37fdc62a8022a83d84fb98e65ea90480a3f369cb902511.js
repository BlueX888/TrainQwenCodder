class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.levelTimeLimit = 2000; // 每关2秒
    this.totalTime = 0; // 总用时（毫秒）
    this.levelStartTime = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建目标纹理
    const targetGraphics = this.add.graphics();
    targetGraphics.fillStyle(0xff0000, 1);
    targetGraphics.fillCircle(30, 30, 30);
    targetGraphics.generateTexture('target', 60, 60);
    targetGraphics.destroy();

    // 初始化游戏
    this.setupLevel();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.timerText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffff00'
    });

    this.instructionText = this.add.text(400, 500, '使用方向键移动到红色目标区域', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.resultText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }

  setupLevel() {
    // 清理之前的游戏对象
    if (this.player) this.player.destroy();
    if (this.target) this.target.destroy();
    if (this.levelTimer) this.levelTimer.remove();

    // 记录关卡开始时间
    this.levelStartTime = this.time.now;

    // 创建玩家（固定起始位置）
    this.player = this.add.sprite(100, 300, 'player');
    this.playerSpeed = 200;

    // 创建目标（根据关卡变化位置）
    const targetPositions = [
      { x: 700, y: 300 },  // 关卡1：右侧
      { x: 400, y: 100 },  // 关卡2：上方
      { x: 700, y: 500 },  // 关卡3：右下
      { x: 100, y: 100 },  // 关卡4：左上
      { x: 400, y: 300 }   // 关卡5：中央
    ];

    const pos = targetPositions[this.currentLevel - 1];
    this.target = this.add.sprite(pos.x, pos.y, 'target');

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });

    // 更新UI
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    
    if (!this.gameOver && !this.gameWon) {
      const remaining = this.levelTimer.getRemaining();
      this.timerText.setText(`剩余时间: ${(remaining / 1000).toFixed(2)}秒`);
    }
  }

  onLevelTimeout() {
    // 超时失败
    this.gameOver = true;
    this.showGameOver();
  }

  checkLevelComplete() {
    // 检测玩家是否到达目标
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.target.x, this.target.y
    );

    if (distance < 50) { // 碰撞检测阈值
      // 计算本关用时
      const levelTime = this.time.now - this.levelStartTime;
      this.totalTime += levelTime;

      // 移除计时器
      if (this.levelTimer) {
        this.levelTimer.remove();
      }

      if (this.currentLevel >= this.maxLevel) {
        // 通关
        this.gameWon = true;
        this.showVictory();
      } else {
        // 进入下一关
        this.currentLevel++;
        this.time.delayedCall(500, () => {
          this.setupLevel();
        });
      }
    }
  }

  showGameOver() {
    this.instructionText.setVisible(false);
    this.timerText.setVisible(false);
    
    const timeUsed = (this.totalTime / 1000).toFixed(2);
    this.resultText.setText(
      `游戏失败！\n\n` +
      `在第 ${this.currentLevel} 关超时\n` +
      `已用时间: ${timeUsed}秒\n\n` +
      `刷新页面重新开始`
    ).setVisible(true);

    // 停止玩家移动
    this.playerSpeed = 0;
  }

  showVictory() {
    this.instructionText.setVisible(false);
    this.timerText.setVisible(false);
    
    const totalTimeSeconds = (this.totalTime / 1000).toFixed(2);
    this.resultText.setText(
      `恭喜通关！\n\n` +
      `完成所有 ${this.maxLevel} 关\n` +
      `总用时: ${totalTimeSeconds}秒\n\n` +
      `平均每关: ${(this.totalTime / this.maxLevel / 1000).toFixed(2)}秒\n\n` +
      `刷新页面重新挑战`
    ).setVisible(true).setFill('#00ff00');

    // 停止玩家移动
    this.playerSpeed = 0;
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 更新计时器显示
    this.updateUI();

    // 玩家移动控制
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown) {
      velocityX = -this.playerSpeed;
    } else if (this.cursors.right.isDown) {
      velocityX = this.playerSpeed;
    }

    if (this.cursors.up.isDown) {
      velocityY = -this.playerSpeed;
    } else if (this.cursors.down.isDown) {
      velocityY = this.playerSpeed;
    }

    // 应用移动
    this.player.x += velocityX * delta / 1000;
    this.player.y += velocityY * delta / 1000;

    // 边界限制
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 20, 580);

    // 检查关卡完成
    this.checkLevelComplete();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);