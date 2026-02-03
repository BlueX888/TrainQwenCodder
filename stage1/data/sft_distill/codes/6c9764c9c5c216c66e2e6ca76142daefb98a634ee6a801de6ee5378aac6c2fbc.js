class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 12;
    this.enemyIncrement = 2;
    this.enemiesRemaining = 0;
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff6600, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

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
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (this.currentLevel - 1) * this.enemyIncrement;
    this.enemiesRemaining = enemyCount;

    // 更新UI
    this.updateUI();

    // 生成敌人（使用固定种子保证可重现性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 使用伪随机生成位置（基于种子）
      const x = ((seed + i * 137) % 700) + 50;
      const y = ((seed + i * 211) % 300) + 50;
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 97) % 200) - 100,
        ((seed + i * 139) % 200) - 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 显示关卡开始信息
    this.messageText.setText(`Level ${this.currentLevel}`);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });
  }

  hitEnemy(player, enemy) {
    // 销毁敌人
    enemy.destroy();
    this.enemiesRemaining--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.enemiesRemaining === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.currentLevel++;
      this.messageText.setText(`Level ${this.currentLevel - 1} Complete!\nNext Level...`);
      this.time.delayedCall(2000, () => {
        this.startLevel();
      });
    } else {
      // 游戏胜利
      this.messageText.setText('Congratulations!\nAll Levels Complete!');
      this.messageText.setStyle({ fill: '#ffff00', fontSize: '36px' });
      this.physics.pause();
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  update(time, delta) {
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
  backgroundColor: '#222222',
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