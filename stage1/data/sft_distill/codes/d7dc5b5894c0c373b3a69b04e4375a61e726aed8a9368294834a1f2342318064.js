class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 20;
    this.enemyIncrement = 2;
    this.remainingEnemies = 0;
    this.player = null;
    this.enemies = null;
    this.levelText = null;
    this.enemyCountText = null;
    this.statusText = null;
    this.cursors = null;
    this.gameCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建 UI 文本
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

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setVisible(false);

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.collectEnemy,
      null,
      this
    );

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.totalLevels) {
      this.gameCompleted = true;
      this.showStatus('恭喜通关！\n完成全部 5 关！');
      return;
    }

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemyIncrement;
    this.remainingEnemies = enemyCount;

    // 更新 UI
    this.updateUI();

    // 生成敌人（使用固定种子保证可重现性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < enemyCount; i++) {
      // 简单的伪随机算法（线性同余生成器）
      const random1 = ((seed + i * 7919) % 997) / 997;
      const random2 = ((seed + i * 7919 + 503) % 991) / 991;
      
      const x = 50 + random1 * 700;
      const y = 50 + random2 * 400;

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        (random1 - 0.5) * 100,
        (random2 - 0.5) * 100
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 显示关卡开始提示
    this.showStatus(`第 ${this.currentLevel} 关开始！\n敌人数量：${enemyCount}`, 2000);
  }

  collectEnemy(player, enemy) {
    // 消灭敌人
    enemy.destroy();
    this.remainingEnemies--;

    // 更新 UI
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies === 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  updateUI() {
    this.levelText.setText(`关卡：${this.currentLevel} / ${this.totalLevels}`);
    this.enemyCountText.setText(`剩余敌人：${this.remainingEnemies}`);
  }

  showStatus(message, duration = null) {
    this.statusText.setText(message);
    this.statusText.setVisible(true);

    if (duration) {
      this.time.delayedCall(duration, () => {
        this.statusText.setVisible(false);
      });
    }
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

// 导出可验证的状态（用于测试）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, GameScene };
}