class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（紫色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x9933ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setVisible(false);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    // 计算当前关卡敌人数量：第1关3个，每关+2个
    this.enemiesPerLevel = 3 + (level - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 使用固定种子生成确定性位置
      const seed = level * 1000 + i;
      const x = 100 + ((seed * 73) % 600);
      const y = 100 + ((seed * 97) % 400);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度（基于种子确定性）
      const vx = 50 + ((seed * 13) % 100) - 50;
      const vy = 50 + ((seed * 17) % 100) - 50;
      enemy.setVelocity(vx, vy);
    }

    // 更新UI
    this.updateUI();

    // 隐藏消息
    this.messageText.setVisible(false);
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0) {
      this.completeLevel();
    }
  }

  completeLevel() {
    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.currentLevel++;
      
      // 显示过关消息
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nNext Level...`);
      this.messageText.setVisible(true);

      // 延迟2秒后开始下一关
      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel);
      });
    } else {
      // 完成所有关卡
      this.messageText.setText('Congratulations!\nAll 5 Levels Complete!');
      this.messageText.setVisible(true);
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
  }

  update(time, delta) {
    // 玩家移动控制
    const speed = 200;

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

// 导出可验证的状态信号
game.getState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentLevel: scene.currentLevel,
    maxLevel: scene.maxLevel,
    enemiesPerLevel: scene.enemiesPerLevel,
    remainingEnemies: scene.remainingEnemies,
    isComplete: scene.currentLevel === scene.maxLevel && scene.remainingEnemies === 0
  };
};