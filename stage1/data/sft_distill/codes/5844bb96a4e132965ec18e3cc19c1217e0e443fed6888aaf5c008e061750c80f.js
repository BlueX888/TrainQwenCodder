// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.currentScene = 'menu'; // 状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建标题文本
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    title.setOrigin(0.5);

    // 创建粉色按钮背景
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0xff69b4, 1); // 粉色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 创建按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    // 鼠标悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xff85c1, 1); // 更亮的粉色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xff69b4, 1); // 恢复原色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
    });

    // 点击事件 - 切换到游戏场景
    buttonZone.on('pointerdown', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0xff4da6, 1); // 按下时更深的粉色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      
      // 延迟切换场景，让按下效果可见
      this.time.delayedCall(150, () => {
        this.currentScene = 'game'; // 更新状态信号
        this.scene.start('GameScene');
      });
    });

    // 添加提示文本
    const hint = this.add.text(width / 2, height * 0.75, '点击按钮开始游戏', {
      fontSize: '18px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    hint.setOrigin(0.5);
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号
    this.score = 0;
    this.health = 100;
    this.level = 1;
    this.currentScene = 'game';
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 背景
    const background = this.add.graphics();
    background.fillStyle(0x1a1a2e, 1);
    background.fillRect(0, 0, width, height);

    // 游戏标题
    const gameTitle = this.add.text(width / 2, 50, '游戏场景', {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    gameTitle.setOrigin(0.5);

    // 创建玩家角色（使用Graphics绘制）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(width / 2, height / 2, 25);
    
    // 添加玩家标签
    const playerLabel = this.add.text(width / 2, height / 2, 'P', {
      fontSize: '24px',
      color: '#000000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    playerLabel.setOrigin(0.5);

    // 状态面板背景
    const panelGraphics = this.add.graphics();
    panelGraphics.fillStyle(0x2d2d44, 0.8);
    panelGraphics.fillRoundedRect(20, height - 120, 250, 100, 8);

    // 显示游戏状态
    this.scoreText = this.add.text(30, height - 110, `分数: ${this.score}`, {
      fontSize: '20px',
      color: '#ffcc00',
      fontFamily: 'Arial'
    });

    this.healthText = this.add.text(30, height - 80, `生命值: ${this.health}`, {
      fontSize: '20px',
      color: '#ff6666',
      fontFamily: 'Arial'
    });

    this.levelText = this.add.text(30, height - 50, `关卡: ${this.level}`, {
      fontSize: '20px',
      color: '#66ccff',
      fontFamily: 'Arial'
    });

    // 返回菜单按钮
    const backButtonWidth = 150;
    const backButtonHeight = 50;
    const backButtonX = width - 100;
    const backButtonY = 50;

    const backButtonGraphics = this.add.graphics();
    backButtonGraphics.fillStyle(0xff69b4, 1);
    backButtonGraphics.fillRoundedRect(
      backButtonX - backButtonWidth / 2,
      backButtonY - backButtonHeight / 2,
      backButtonWidth,
      backButtonHeight,
      8
    );

    const backButtonText = this.add.text(backButtonX, backButtonY, '返回菜单', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    backButtonText.setOrigin(0.5);

    const backButtonZone = this.add.zone(
      backButtonX,
      backButtonY,
      backButtonWidth,
      backButtonHeight
    ).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backButtonZone.on('pointerdown', () => {
      this.currentScene = 'menu'; // 更新状态信号
      this.scene.start('MenuScene');
    });

    // 模拟游戏逻辑：定时增加分数
    this.scoreTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.score += 10;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 每100分升级
        if (this.score % 100 === 0 && this.score > 0) {
          this.level++;
          this.levelText.setText(`关卡: ${this.level}`);
        }
      },
      loop: true
    });

    // 添加说明文本
    const instruction = this.add.text(width / 2, height - 160, '游戏已开始！分数自动增长', {
      fontSize: '18px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    });
    instruction.setOrigin(0.5);
  }

  update(time, delta) {
    // 可以在这里添加游戏更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // 场景数组，第一个场景会自动启动
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);