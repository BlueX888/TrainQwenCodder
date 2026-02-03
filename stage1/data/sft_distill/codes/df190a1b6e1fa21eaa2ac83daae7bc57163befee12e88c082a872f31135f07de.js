class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 5;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.statusText.setVisible(false);

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.maxLevel) {
      this.gameWon = true;
      this.showVictory();
      return;
    }

    // 清除现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 生成敌人
    for (let i = 0; i < enemyCount; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();

    // 显示关卡开始提示
    this.statusText.setText(`Level ${this.currentLevel}`);
    this.statusText.setVisible(true);
    this.time.delayedCall(1500, () => {
      this.statusText.setVisible(false);
    });
  }

  hitEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否通关
    if (this.remainingEnemies <= 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
  }

  showVictory() {
    this.statusText.setText('VICTORY!\nAll Levels Complete!');
    this.statusText.setStyle({ fontSize: '48px', fill: '#ffff00' });
    this.statusText.setVisible(true);
    this.physics.pause();
  }

  update(time, delta) {
    if (this.gameWon) {
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