// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.sceneState = 'menu'; // 状态信号
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 添加标题
    const title = this.add.text(width / 2, height / 3, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 创建按钮背景（绿色矩形）
    const buttonWidth = 200;
    const buttonHeight = 60;
    const buttonX = width / 2;
    const buttonY = height / 2;

    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x00ff00, 1); // 绿色
    buttonGraphics.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );

    // 创建按钮文本
    const buttonText = this.add.text(buttonX, buttonY, '开始游戏', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 创建交互区域
    const buttonZone = this.add.zone(
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight
    ).setInteractive({ useHandCursor: true });

    // 按钮悬停效果
    buttonZone.on('pointerover', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x00cc00, 1); // 深绿色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setScale(1.05);
    });

    buttonZone.on('pointerout', () => {
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x00ff00, 1); // 恢复绿色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      buttonText.setScale(1);
    });

    // 点击按钮切换到游戏场景
    buttonZone.on('pointerdown', () => {
      this.sceneState = 'switching'; // 更新状态信号
      
      // 添加点击反馈
      buttonGraphics.clear();
      buttonGraphics.fillStyle(0x009900, 1); // 更深的绿色
      buttonGraphics.fillRoundedRect(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        10
      );
      
      // 延迟切换场景，让玩家看到点击效果
      this.time.delayedCall(100, () => {
        this.scene.start('GameScene');
      });
    });

    // 添加状态信息（用于验证）
    const statusText = this.add.text(10, 10, `场景状态: ${this.sceneState}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 更新状态显示
    this.time.addEvent({
      delay: 100,
      callback: () => {
        statusText.setText(`场景状态: ${this.sceneState}`);
      },
      loop: true
    });
  }

  update(time, delta) {
    // 菜单场景无需每帧更新
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.sceneState = 'game'; // 状态信号
    this.score = 0; // 可验证的状态变量
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 设置背景色（通过 Graphics）
    const background = this.add.graphics();
    background.fillStyle(0x1a1a2e, 1);
    background.fillRect(0, 0, width, height);

    // 游戏标题
    const title = this.add.text(width / 2, 80, '游戏场景', {
      fontSize: '42px',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示游戏状态信息
    this.statusText = this.add.text(width / 2, 150, '', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建一个简单的游戏对象（可交互的方块）
    const playerSize = 50;
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(
      width / 2 - playerSize / 2,
      height / 2 - playerSize / 2,
      playerSize,
      playerSize
    );

    // 添加说明文本
    const instruction = this.add.text(width / 2, height - 150, '点击屏幕增加分数\nESC 键返回菜单', {
      fontSize: '18px',
      color: '#aaaaaa',
      align: 'center'
    });
    instruction.setOrigin(0.5);

    // 点击屏幕增加分数
    this.input.on('pointerdown', (pointer) => {
      this.score += 10;
      
      // 创建分数提示动画
      const scorePopup = this.add.text(pointer.x, pointer.y, '+10', {
        fontSize: '24px',
        color: '#ffff00',
        fontStyle: 'bold'
      });
      scorePopup.setOrigin(0.5);
      
      this.tweens.add({
        targets: scorePopup,
        y: pointer.y - 50,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          scorePopup.destroy();
        }
      });
    });

    // ESC 键返回菜单
    this.input.keyboard.on('keydown-ESC', () => {
      this.sceneState = 'returning';
      this.scene.start('MenuScene');
    });

    // 更新状态显示
    this.updateStatusText();
  }

  update(time, delta) {
    // 累计游戏时间
    this.gameTime += delta;
    
    // 每秒更新一次等级（示例逻辑）
    if (Math.floor(this.gameTime / 1000) > this.level - 1) {
      this.level = Math.floor(this.gameTime / 1000) + 1;
    }

    // 更新状态显示
    this.updateStatusText();
  }

  updateStatusText() {
    const timeSeconds = (this.gameTime / 1000).toFixed(1);
    this.statusText.setText(
      `场景状态: ${this.sceneState}\n` +
      `分数: ${this.score}\n` +
      `等级: ${this.level}\n` +
      `生命值: ${this.health}\n` +
      `游戏时间: ${timeSeconds}秒`
    );
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: [MenuScene, GameScene], // 注册两个场景，MenuScene 为默认首场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口（用于测试验证）
window.getGameState = function() {
  const currentScene = game.scene.getScene(game.scene.keys[0]);
  if (currentScene && currentScene.scene.key === 'GameScene') {
    return {
      scene: 'GameScene',
      score: currentScene.score,
      level: currentScene.level,
      health: currentScene.health,
      gameTime: currentScene.gameTime
    };
  } else if (currentScene && currentScene.scene.key === 'MenuScene') {
    return {
      scene: 'MenuScene',
      sceneState: currentScene.sceneState
    };
  }
  return { scene: 'unknown' };
};