class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 5; // 第一关敌人数
    this.enemyIncrement = 2; // 每关增加数量
    this.remainingEnemies = 0;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameCompleted = true;
      this.showVictoryMessage();
      return;
    }

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.enemiesPerLevel + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 生成敌人（使用固定种子确保位置可预测）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机但确定的位置
      const x = 100 + ((seed + i * 137) % 600);
      const y = 100 + ((seed + i * 211) % 300);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();
    
    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.currentLevel} Start!`);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });
  }

  hitEnemy(player, enemy) {
    // 移除敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示关卡完成信息
    this.messageText.setText(`Level ${this.currentLevel} Complete!`);

    // 进入下一关
    this.time.delayedCall(2000, () => {
      this.currentLevel++;
      this.startLevel();
    });
  }

  showVictoryMessage() {
    this.player.setVelocity(0, 0);
    this.messageText.setText('Congratulations!\nAll 5 Levels Completed!');
    this.levelText.setText('GAME COMPLETE');
    this.enemyCountText.setText('');
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  update(time, delta) {
    if (this.gameCompleted) {
      return;
    }

    // 玩家移动控制
    const speed = 300;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// 可验证的状态信号（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    remainingEnemies: scene.remainingEnemies,
    gameCompleted: scene.gameCompleted,
    totalEnemiesThisLevel: scene.enemiesPerLevel + (scene.currentLevel - 1) * scene.enemyIncrement
  };
};