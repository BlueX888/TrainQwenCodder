class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesRemaining = 0;
    this.score = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 生成子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#fff'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#fff'
    });

    this.scoreText = this.add.text(16, 80, 'Score: 0', {
      fontSize: '20px',
      fill: '#fff'
    });

    this.instructionText = this.add.text(400, 300, '', {
      fontSize: '18px',
      fill: '#fff',
      align: 'center'
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFireTime = 0;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    // 清空现有敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量：5 + 2 * (level - 1)
    const enemyCount = 5 + 2 * (this.currentLevel - 1);
    this.enemiesRemaining = enemyCount;

    // 更新UI
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);

    // 显示关卡开始提示
    this.instructionText.setText(
      `Level ${this.currentLevel}\n` +
      `Enemies: ${enemyCount}\n` +
      `Arrow Keys: Move\n` +
      `Space: Shoot`
    );
    this.instructionText.setVisible(true);

    // 2秒后隐藏提示并生成敌人
    this.time.delayedCall(2000, () => {
      this.instructionText.setVisible(false);
      this.spawnEnemies(enemyCount);
    });
  }

  spawnEnemies(count) {
    // 使用固定种子生成敌人位置（确保可重现）
    const seed = this.currentLevel * 1000;
    
    for (let i = 0; i < count; i++) {
      // 使用伪随机生成位置
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 211) % 200);

      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 100) - 50,
        ((seed + i * 97) % 50) + 20
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.destroy();
    enemy.destroy();

    // 更新分数和敌人计数
    this.score += 10;
    this.enemiesRemaining--;
    this.scoreText.setText(`Score: ${this.score}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);

    // 检查是否清空所有敌人
    if (this.enemiesRemaining <= 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel >= this.maxLevel) {
      // 游戏胜利
      this.instructionText.setText(
        `GAME COMPLETE!\n` +
        `Final Score: ${this.score}\n` +
        `All ${this.maxLevel} levels cleared!`
      );
      this.instructionText.setVisible(true);
      this.scene.pause();
    } else {
      // 进入下一关
      this.currentLevel++;
      this.instructionText.setText(
        `Level ${this.currentLevel - 1} Complete!\n` +
        `Get ready for Level ${this.currentLevel}...`
      );
      this.instructionText.setVisible(true);

      // 3秒后开始下一关
      this.time.delayedCall(3000, () => {
        this.startLevel();
      });
    }
  }

  fireBullet() {
    const now = this.time.now;
    if (now - this.lastFireTime < 300) {
      return; // 限制射击频率
    }
    this.lastFireTime = now;

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);

      // 子弹超出屏幕后销毁
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy();
        }
      });
    }
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.fireBullet();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });
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