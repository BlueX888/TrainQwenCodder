class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 5;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（蓝色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x0000ff, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 使用固定种子生成敌人位置（确保确定性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 伪随机位置生成（基于种子）
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 200) - 100,
        ((seed + i * 97) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 敌人之间的碰撞
    this.physics.add.collider(this.enemies, this.enemies);

    // 玩家与敌人的碰撞
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // UI文本
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

    // 更新UI
    this.updateUI();

    // 状态变量（用于验证）
    this.gameState = {
      level: this.currentLevel,
      totalLevels: this.totalLevels,
      remainingEnemies: this.remainingEnemies,
      totalEnemies: enemyCount,
      isComplete: false
    };
  }

  update() {
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

    // 检查是否所有敌人都被消灭
    if (this.remainingEnemies === 0 && !this.isTransitioning) {
      this.isTransitioning = true;
      this.handleLevelComplete();
    }
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;
    
    // 更新UI和状态
    this.updateUI();
    this.gameState.remainingEnemies = this.remainingEnemies;
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  handleLevelComplete() {
    if (this.currentLevel < this.totalLevels) {
      // 进入下一关
      this.messageText.setText(`Level ${this.currentLevel} Complete!\nNext Level...`);
      this.messageText.setVisible(true);
      
      this.time.delayedCall(2000, () => {
        this.currentLevel++;
        this.scene.restart();
      });
    } else {
      // 游戏胜利
      this.messageText.setText('YOU WIN!\nAll Levels Complete!');
      this.messageText.setVisible(true);
      this.gameState.isComplete = true;
      
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      this.cursors = null;
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