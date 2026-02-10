class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.baseEnemyCount = 12;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1); // 灰色
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
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
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    this.messageText.setOrigin(0.5);
    this.messageText.setVisible(false);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.collectEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    // 清除现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemyCount + (level - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 生成敌人
    const seed = level * 1000; // 固定种子保证确定性
    let rng = this.createSeededRandom(seed);

    for (let i = 0; i < enemyCount; i++) {
      const x = 50 + rng() * 700;
      const y = 50 + rng() * 350;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (rng() - 0.5) * 100,
        (rng() - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新UI
    this.updateUI();
  }

  createSeededRandom(seed) {
    // 简单的伪随机数生成器
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  collectEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies <= 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏通关
      this.showMessage('恭喜通关！所有关卡完成！');
      this.physics.pause();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.showMessage(`第 ${this.currentLevel} 关开始！`, () => {
        this.startLevel(this.currentLevel);
      });
    }
  }

  showMessage(text, callback) {
    this.messageText.setText(text);
    this.messageText.setVisible(true);
    this.physics.pause();

    this.time.delayedCall(2000, () => {
      this.messageText.setVisible(false);
      this.physics.resume();
      if (callback) {
        callback();
      }
    });
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`剩余敌人: ${this.remainingEnemies}`);
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
  backgroundColor: '#000000',
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