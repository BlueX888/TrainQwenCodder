// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: [GameScene, ResultScene]
};

// 主游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 8;
    this.levelTimeLimit = 2500; // 2.5秒（毫秒）
    this.totalElapsedTime = 0; // 总用时（毫秒）
    this.levelStartTime = 0;
    this.levelTimer = null;
    this.remainingTime = 0;
    this.gameState = 'playing'; // playing, failed, completed
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化关卡开始时间
    this.levelStartTime = this.time.now;
    this.remainingTime = this.levelTimeLimit;
    this.gameState = 'playing';

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建UI文本
    this.levelText = this.add.text(20, 20, `关卡: ${this.currentLevel}/${this.maxLevel}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    this.timerText = this.add.text(20, 55, '剩余时间: 2.50s', {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    });

    this.totalTimeText = this.add.text(20, 85, `总用时: ${(this.totalElapsedTime / 1000).toFixed(2)}s`, {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    });

    this.hintText = this.add.text(400, 550, '点击绿色目标完成关卡', {
      fontSize: '16px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 生成目标区域
    this.createTarget();

    // 创建关卡计时器
    this.levelTimer = this.time.addEvent({
      delay: this.levelTimeLimit,
      callback: this.onLevelTimeout,
      callbackScope: this,
      loop: false
    });
  }

  createTarget() {
    // 随机生成目标位置（使用关卡作为种子保证可重现）
    const seed = this.currentLevel * 12345;
    const random = this.seededRandom(seed);
    
    const minX = 100;
    const maxX = 700;
    const minY = 150;
    const maxY = 500;
    
    const targetX = minX + random() * (maxX - minX);
    const targetY = minY + random() * (maxY - minY);
    const targetSize = 60 + random() * 40; // 60-100像素

    // 绘制目标
    this.target = this.add.graphics();
    this.target.fillStyle(0x00ff00, 1);
    this.target.fillCircle(targetX, targetY, targetSize / 2);
    this.target.lineStyle(3, 0xffffff, 1);
    this.target.strokeCircle(targetX, targetY, targetSize / 2);

    // 存储目标信息用于碰撞检测
    this.targetInfo = {
      x: targetX,
      y: targetY,
      radius: targetSize / 2
    };

    // 添加点击事件
    this.input.on('pointerdown', this.onPointerDown, this);
  }

  onPointerDown(pointer) {
    if (this.gameState !== 'playing') return;

    const dx = pointer.x - this.targetInfo.x;
    const dy = pointer.y - this.targetInfo.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= this.targetInfo.radius) {
      // 点击成功
      this.onLevelComplete();
    }
  }

  onLevelComplete() {
    if (this.gameState !== 'playing') return;

    // 记录本关用时
    const levelTime = this.time.now - this.levelStartTime;
    this.totalElapsedTime += levelTime;

    // 停止计时器
    if (this.levelTimer) {
      this.levelTimer.remove();
    }

    // 移除点击事件
    this.input.off('pointerdown', this.onPointerDown, this);

    // 检查是否通关
    if (this.currentLevel >= this.maxLevel) {
      // 全部通关
      this.gameState = 'completed';
      this.scene.start('ResultScene', { 
        totalTime: this.totalElapsedTime,
        success: true 
      });
    } else {
      // 进入下一关
      this.currentLevel++;
      this.scene.restart();
    }
  }

  onLevelTimeout() {
    if (this.gameState !== 'playing') return;

    // 超时失败
    this.gameState = 'failed';
    
    // 显示失败提示
    const failText = this.add.text(400, 300, '超时失败！', {
      fontSize: '48px',
      color: '#ff0000',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 360, '游戏将在2秒后重新开始...', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 移除点击事件
    this.input.off('pointerdown', this.onPointerDown, this);

    // 2秒后重置游戏
    this.time.delayedCall(2000, () => {
      this.currentLevel = 1;
      this.totalElapsedTime = 0;
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameState === 'playing' && this.levelTimer) {
      // 更新剩余时间显示
      this.remainingTime = this.levelTimeLimit - this.levelTimer.getElapsed();
      if (this.remainingTime < 0) this.remainingTime = 0;
      
      const seconds = (this.remainingTime / 1000).toFixed(2);
      this.timerText.setText(`剩余时间: ${seconds}s`);
      
      // 时间不足时变红
      if (this.remainingTime < 1000) {
        this.timerText.setColor('#ff0000');
      } else {
        this.timerText.setColor('#00ff00');
      }

      // 更新总用时
      const currentTotalTime = this.totalElapsedTime + (time - this.levelStartTime);
      this.totalTimeText.setText(`总用时: ${(currentTotalTime / 1000).toFixed(2)}s`);
    }
  }

  // 简单的伪随机数生成器（确保可重现）
  seededRandom(seed) {
    let value = seed;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }
}

// 结果场景
class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  init(data) {
    this.totalTime = data.totalTime || 0;
    this.success = data.success || false;
  }

  preload() {
    // 无需加载资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a1a, 1);
    bg.fillRect(0, 0, 800, 600);

    // 成功标题
    this.add.text(400, 150, '🎉 恭喜通关！', {
      fontSize: '48px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 显示总用时
    const totalSeconds = (this.totalTime / 1000).toFixed(2);
    this.add.text(400, 250, `总用时: ${totalSeconds}秒`, {
      fontSize: '36px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 平均每关用时
    const avgTime = (this.totalTime / 8000).toFixed(2);
    this.add.text(400, 310, `平均每关: ${avgTime}秒`, {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 评价
    let rating = '';
    if (this.totalTime < 10000) {
      rating = '神速！⚡';
    } else if (this.totalTime < 15000) {
      rating = '优秀！⭐';
    } else if (this.totalTime < 18000) {
      rating = '良好！👍';
    } else {
      rating = '完成！✓';
    }

    this.add.text(400, 370, rating, {
      fontSize: '32px',
      color: '#ff9900',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 重新开始提示
    const restartText = this.add.text(400, 480, '点击屏幕重新开始', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    // 点击重新开始
    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

// 启动游戏
new Phaser.Game(config);